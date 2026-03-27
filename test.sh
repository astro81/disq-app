#!/usr/bin/env bash
# =============================================================================
# Complete API Test Script — Hono + Neon + Drizzle + UploadThing
# =============================================================================
# Usage:
#   chmod +x test.sh
#   ./test.sh                        # runs against localhost:3000
#   BASE_URL=https://api.example.com ./test.sh
# =============================================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── State (populated during the run) ──────────────────────────────────────────
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""

# Unique suffix so re-runs don't collide on unique constraints
SUFFIX="$(date +%s)"
USERNAME="testuser_${SUFFIX}"
EMAIL="test_${SUFFIX}@example.com"
PASSWORD="password123"
DISPLAY_NAME="Test User"

# ── Helpers ───────────────────────────────────────────────────────────────────
section() {
  echo ""
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${CYAN}${BOLD}  $1${RESET}"
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

# assert <test_name> <expected_http_status> <actual_http_status> [response_body]
assert() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  local body="$4"

  if [ "$actual" -eq "$expected" ]; then
    echo -e "  ${GREEN}✓ PASS${RESET}  $name ${YELLOW}[$actual]${RESET}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${RESET}  $name"
    echo -e "         expected HTTP $expected, got HTTP $actual"
    if [ -n "$body" ]; then
      echo -e "         body: $body"
    fi
    FAIL=$((FAIL + 1))
  fi
}

# json_field <json_string> <field>  — tiny jq-free parser for simple string values
json_field() {
  echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

# do_request <METHOD> <path> [bearer_token] [json_body]
# prints "BODY|||STATUS"
do_request() {
  local method="$1"
  local path="$2"
  local token="$3"
  local body="$4"

  local args=(-s -w "|||%{http_code}" -X "$method")
  args+=(-H "Content-Type: application/json")

  if [ -n "$token" ]; then
    args+=(-H "Authorization: Bearer $token")
  fi

  if [ -n "$body" ]; then
    args+=(-d "$body")
  fi

  curl "${args[@]}" "${BASE_URL}${path}"
}

# split "BODY|||STATUS" → $RESP_BODY and $RESP_STATUS
split_response() {
  RESP_BODY="${1%|||*}"
  RESP_STATUS="${1##*|||}"
}

# =============================================================================
# HEALTH CHECK
# =============================================================================
section "Health Check"

RAW=$(do_request GET "/")
split_response "$RAW"
assert "GET / returns 200" 200 "$RESP_STATUS"

# =============================================================================
# AUTH — REGISTER
# =============================================================================
section "Auth — Register"

# 1. Missing fields
RAW=$(do_request POST "/api/users/register" "" \
  '{"username":"","email":"","password":"","displayName":""}')
split_response "$RAW"
assert "Register: empty fields → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 2. Short password
RAW=$(do_request POST "/api/users/register" "" \
  "{\"username\":\"${USERNAME}\",\"email\":\"${EMAIL}\",\"password\":\"short\",\"displayName\":\"${DISPLAY_NAME}\"}")
split_response "$RAW"
assert "Register: password < 8 chars → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 3. Valid registration
RAW=$(do_request POST "/api/users/register" "" \
  "{\"username\":\"${USERNAME}\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"displayName\":\"${DISPLAY_NAME}\"}")
split_response "$RAW"
assert "Register: valid user → 201" 201 "$RESP_STATUS" "$RESP_BODY"

ACCESS_TOKEN=$(json_field "$RESP_BODY" "accessToken")
REFRESH_TOKEN=$(json_field "$RESP_BODY" "refreshToken")
USER_ID=$(echo "$RESP_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "  ${RED}  ✗ Could not extract accessToken — subsequent auth tests may fail${RESET}"
fi

# 4. Duplicate username
RAW=$(do_request POST "/api/users/register" "" \
  "{\"username\":\"${USERNAME}\",\"email\":\"other_${SUFFIX}@example.com\",\"password\":\"${PASSWORD}\",\"displayName\":\"${DISPLAY_NAME}\"}")
split_response "$RAW"
assert "Register: duplicate username → 409" 409 "$RESP_STATUS" "$RESP_BODY"

# 5. Duplicate email
RAW=$(do_request POST "/api/users/register" "" \
  "{\"username\":\"other_${SUFFIX}\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"displayName\":\"${DISPLAY_NAME}\"}")
split_response "$RAW"
assert "Register: duplicate email → 409" 409 "$RESP_STATUS" "$RESP_BODY"

# =============================================================================
# AUTH — LOGIN
# =============================================================================
section "Auth — Login"

# 1. Missing identifier
RAW=$(do_request POST "/api/users/login" "" \
  '{"identifier":"","password":"password123"}')
split_response "$RAW"
assert "Login: missing identifier → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 2. Missing password
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${USERNAME}\",\"password\":\"\"}")
split_response "$RAW"
assert "Login: missing password → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 3. Wrong password
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${USERNAME}\",\"password\":\"wrongpassword\"}")
split_response "$RAW"
assert "Login: wrong password → 401" 401 "$RESP_STATUS" "$RESP_BODY"

# 4. Non-existent user
RAW=$(do_request POST "/api/users/login" "" \
  '{"identifier":"nobody_xyz_abc","password":"password123"}')
split_response "$RAW"
assert "Login: non-existent user → 401" 401 "$RESP_STATUS" "$RESP_BODY"

# 5. Valid login with username
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")
split_response "$RAW"
assert "Login: valid login via username → 200" 200 "$RESP_STATUS" "$RESP_BODY"
ACCESS_TOKEN=$(json_field "$RESP_BODY" "accessToken")
REFRESH_TOKEN=$(json_field "$RESP_BODY" "refreshToken")

# 6. Valid login with email
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")
split_response "$RAW"
assert "Login: valid login via email → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# =============================================================================
# AUTH — REFRESH TOKEN
# =============================================================================
section "Auth — Refresh Token"

# 1. Missing body
RAW=$(do_request POST "/api/users/refresh" "" '{}')
split_response "$RAW"
assert "Refresh: missing token → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 2. Invalid token
RAW=$(do_request POST "/api/users/refresh" "" \
  '{"refreshToken":"invalid-token-xyz-000"}')
split_response "$RAW"
assert "Refresh: invalid token → 401" 401 "$RESP_STATUS" "$RESP_BODY"

# 3. Valid rotation
RAW=$(do_request POST "/api/users/refresh" "" \
  "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")
split_response "$RAW"
assert "Refresh: valid token → 200 + new tokens" 200 "$RESP_STATUS" "$RESP_BODY"

OLD_REFRESH="$REFRESH_TOKEN"
NEW_ACCESS=$(json_field "$RESP_BODY" "accessToken")
NEW_REFRESH=$(json_field "$RESP_BODY" "refreshToken")
if [ -n "$NEW_ACCESS" ]; then
  ACCESS_TOKEN="$NEW_ACCESS"
  REFRESH_TOKEN="$NEW_REFRESH"
fi

# 4. Reusing a rotated (consumed) refresh token should fail
RAW=$(do_request POST "/api/users/refresh" "" \
  "{\"refreshToken\":\"${OLD_REFRESH}\"}")
split_response "$RAW"
assert "Refresh: reuse rotated token → 401" 401 "$RESP_STATUS" "$RESP_BODY"

# Rotate once more to get fresh tokens for the rest of the suite
RAW=$(do_request POST "/api/users/refresh" "" \
  "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")
split_response "$RAW"
NEW_ACCESS=$(json_field "$RESP_BODY" "accessToken")
NEW_REFRESH=$(json_field "$RESP_BODY" "refreshToken")
if [ -n "$NEW_ACCESS" ]; then
  ACCESS_TOKEN="$NEW_ACCESS"
  REFRESH_TOKEN="$NEW_REFRESH"
fi

# =============================================================================
# PROTECTED ROUTES — no token / invalid token
# =============================================================================
section "Protected Routes — Unauthorized"

RAW=$(do_request GET "/api/users")
split_response "$RAW"
assert "GET /api/users — no token → 401" 401 "$RESP_STATUS"

RAW=$(do_request GET "/api/users/me")
split_response "$RAW"
assert "GET /api/users/me — no token → 401" 401 "$RESP_STATUS"

RAW=$(do_request GET "/api/users/${USER_ID}")
split_response "$RAW"
assert "GET /api/users/:id — no token → 401" 401 "$RESP_STATUS"

RAW=$(do_request PATCH "/api/users/me" "invalid.token.here" '{"displayName":"x"}')
split_response "$RAW"
assert "PATCH /api/users/me — invalid token → 401" 401 "$RESP_STATUS"

RAW=$(do_request DELETE "/api/users/me/avatar" "bad.token")
split_response "$RAW"
assert "DELETE /api/users/me/avatar — bad token → 401" 401 "$RESP_STATUS"

# =============================================================================
# USER READS
# =============================================================================
section "User Reads (Protected)"

# 1. GET /api/users
RAW=$(do_request GET "/api/users" "$ACCESS_TOKEN")
split_response "$RAW"
assert "GET /api/users → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 2. GET /api/users/me
RAW=$(do_request GET "/api/users/me" "$ACCESS_TOKEN")
split_response "$RAW"
assert "GET /api/users/me → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 3. GET /api/users/:id — valid
RAW=$(do_request GET "/api/users/${USER_ID}" "$ACCESS_TOKEN")
split_response "$RAW"
assert "GET /api/users/:id (valid) → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 4. GET /api/users/:id — not found
RAW=$(do_request GET "/api/users/00000000-0000-0000-0000-000000000000" "$ACCESS_TOKEN")
split_response "$RAW"
assert "GET /api/users/:id (not found) → 404" 404 "$RESP_STATUS" "$RESP_BODY"

# =============================================================================
# PROFILE UPDATE
# =============================================================================
section "Profile Update"

# 1. No fields provided
RAW=$(do_request PATCH "/api/users/me" "$ACCESS_TOKEN" '{}')
split_response "$RAW"
assert "PATCH /me: no fields → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 2. Update displayName
RAW=$(do_request PATCH "/api/users/me" "$ACCESS_TOKEN" \
  '{"displayName":"Updated Name"}')
split_response "$RAW"
assert "PATCH /me: update displayName → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 3. Update username
NEW_USERNAME="updated_${SUFFIX}"
RAW=$(do_request PATCH "/api/users/me" "$ACCESS_TOKEN" \
  "{\"username\":\"${NEW_USERNAME}\"}")
split_response "$RAW"
assert "PATCH /me: update username → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 4. Update email
NEW_EMAIL="updated_${SUFFIX}@example.com"
RAW=$(do_request PATCH "/api/users/me" "$ACCESS_TOKEN" \
  "{\"email\":\"${NEW_EMAIL}\"}")
split_response "$RAW"
assert "PATCH /me: update email → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 5. Register a second user so we can test conflict detection
RAW=$(do_request POST "/api/users/register" "" \
  "{\"username\":\"second_${SUFFIX}\",\"email\":\"second_${SUFFIX}@example.com\",\"password\":\"password123\",\"displayName\":\"Second User\"}")
split_response "$RAW"

# 6. Try to take second user's username
RAW=$(do_request PATCH "/api/users/me" "$ACCESS_TOKEN" \
  "{\"username\":\"second_${SUFFIX}\"}")
split_response "$RAW"
assert "PATCH /me: conflicting username → 409" 409 "$RESP_STATUS" "$RESP_BODY"

# 7. Try to take second user's email
RAW=$(do_request PATCH "/api/users/me" "$ACCESS_TOKEN" \
  "{\"email\":\"second_${SUFFIX}@example.com\"}")
split_response "$RAW"
assert "PATCH /me: conflicting email → 409" 409 "$RESP_STATUS" "$RESP_BODY"

# =============================================================================
# AVATAR ENDPOINTS
# =============================================================================
section "Avatar Endpoints"

# 1. Save avatar URL (simulates UploadThing client callback)
RAW=$(do_request PATCH "/api/users/me/avatar" "$ACCESS_TOKEN" \
  '{"url":"https://utfs.io/f/fake-avatar-key-abc123.jpg"}')
split_response "$RAW"
assert "PATCH /me/avatar: save URL → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 2. Missing URL field
RAW=$(do_request PATCH "/api/users/me/avatar" "$ACCESS_TOKEN" '{}')
split_response "$RAW"
assert "PATCH /me/avatar: missing url → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 3. Replace avatar (old one gets deleted from UploadThing)
RAW=$(do_request PATCH "/api/users/me/avatar" "$ACCESS_TOKEN" \
  '{"url":"https://utfs.io/f/fake-avatar-key-newone.jpg"}')
split_response "$RAW"
assert "PATCH /me/avatar: replace URL → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 4. Remove avatar
RAW=$(do_request DELETE "/api/users/me/avatar" "$ACCESS_TOKEN")
split_response "$RAW"
assert "DELETE /me/avatar → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 5. Remove avatar when none set
RAW=$(do_request DELETE "/api/users/me/avatar" "$ACCESS_TOKEN")
split_response "$RAW"
assert "DELETE /me/avatar (none set) → 404" 404 "$RESP_STATUS" "$RESP_BODY"

# =============================================================================
# BANNER ENDPOINTS
# =============================================================================
section "Banner Endpoints"

# 1. Save banner URL
RAW=$(do_request PATCH "/api/users/me/banner" "$ACCESS_TOKEN" \
  '{"url":"https://utfs.io/f/fake-banner-key-abc123.jpg"}')
split_response "$RAW"
assert "PATCH /me/banner: save URL → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 2. Missing URL field
RAW=$(do_request PATCH "/api/users/me/banner" "$ACCESS_TOKEN" '{}')
split_response "$RAW"
assert "PATCH /me/banner: missing url → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 3. Replace banner
RAW=$(do_request PATCH "/api/users/me/banner" "$ACCESS_TOKEN" \
  '{"url":"https://utfs.io/f/fake-banner-key-newone.jpg"}')
split_response "$RAW"
assert "PATCH /me/banner: replace URL → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 4. Remove banner
RAW=$(do_request DELETE "/api/users/me/banner" "$ACCESS_TOKEN")
split_response "$RAW"
assert "DELETE /me/banner → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 5. Remove banner when none set
RAW=$(do_request DELETE "/api/users/me/banner" "$ACCESS_TOKEN")
split_response "$RAW"
assert "DELETE /me/banner (none set) → 404" 404 "$RESP_STATUS" "$RESP_BODY"

# =============================================================================
# LOGOUT (current device)
# =============================================================================
section "Logout — Current Device"

# 1. Missing refresh token body
RAW=$(do_request POST "/api/users/logout" "$ACCESS_TOKEN" '{}')
split_response "$RAW"
assert "POST /logout: missing refreshToken → 400" 400 "$RESP_STATUS" "$RESP_BODY"

# 2. No access token
RAW=$(do_request POST "/api/users/logout" "" \
  "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")
split_response "$RAW"
assert "POST /logout: no access token → 401" 401 "$RESP_STATUS" "$RESP_BODY"

# 3. Valid logout
RAW=$(do_request POST "/api/users/logout" "$ACCESS_TOKEN" \
  "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")
split_response "$RAW"
assert "POST /logout: valid → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 4. Refresh token must now be invalid
RAW=$(do_request POST "/api/users/refresh" "" \
  "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")
split_response "$RAW"
assert "Refresh after /logout → 401" 401 "$RESP_STATUS" "$RESP_BODY"

# Re-login to continue
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${NEW_USERNAME}\",\"password\":\"${PASSWORD}\"}")
split_response "$RAW"
ACCESS_TOKEN=$(json_field "$RESP_BODY" "accessToken")
REFRESH_TOKEN=$(json_field "$RESP_BODY" "refreshToken")

# =============================================================================
# LOGOUT ALL DEVICES
# =============================================================================
section "Logout — All Devices"

# Create a second session (simulate another device)
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${NEW_USERNAME}\",\"password\":\"${PASSWORD}\"}")
split_response "$RAW"
SECOND_REFRESH=$(json_field "$RESP_BODY" "refreshToken")

# Create a third session
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${NEW_USERNAME}\",\"password\":\"${PASSWORD}\"}")
split_response "$RAW"
THIRD_REFRESH=$(json_field "$RESP_BODY" "refreshToken")

# Logout all
RAW=$(do_request POST "/api/users/logout-all" "$ACCESS_TOKEN")
split_response "$RAW"
assert "POST /logout-all → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# All three refresh tokens must now be invalid
RAW=$(do_request POST "/api/users/refresh" "" \
  "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")
split_response "$RAW"
assert "Device 1 refresh invalid after /logout-all → 401" 401 "$RESP_STATUS"

RAW=$(do_request POST "/api/users/refresh" "" \
  "{\"refreshToken\":\"${SECOND_REFRESH}\"}")
split_response "$RAW"
assert "Device 2 refresh invalid after /logout-all → 401" 401 "$RESP_STATUS"

RAW=$(do_request POST "/api/users/refresh" "" \
  "{\"refreshToken\":\"${THIRD_REFRESH}\"}")
split_response "$RAW"
assert "Device 3 refresh invalid after /logout-all → 401" 401 "$RESP_STATUS"

# =============================================================================
# ACCOUNT DELETION
# =============================================================================
section "Account Deletion"

# Re-login for deletion test
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${NEW_USERNAME}\",\"password\":\"${PASSWORD}\"}")
split_response "$RAW"
ACCESS_TOKEN=$(json_field "$RESP_BODY" "accessToken")

# 1. No token
RAW=$(do_request DELETE "/api/users/me")
split_response "$RAW"
assert "DELETE /me: no token → 401" 401 "$RESP_STATUS"

# 2. Valid deletion
RAW=$(do_request DELETE "/api/users/me" "$ACCESS_TOKEN")
split_response "$RAW"
assert "DELETE /me → 200" 200 "$RESP_STATUS" "$RESP_BODY"

# 3. Login after deletion must fail
RAW=$(do_request POST "/api/users/login" "" \
  "{\"identifier\":\"${NEW_USERNAME}\",\"password\":\"${PASSWORD}\"}")
split_response "$RAW"
assert "Login after account deletion → 401" 401 "$RESP_STATUS" "$RESP_BODY"

# 4. Deleted user should not appear by ID
RAW=$(do_request GET "/api/users/${USER_ID}" "$ACCESS_TOKEN")
split_response "$RAW"
assert "GET deleted user by ID → 404" 404 "$RESP_STATUS" "$RESP_BODY"

# =============================================================================
# SUMMARY
# =============================================================================
TOTAL=$((PASS + FAIL))
echo ""
echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
if [ "$FAIL" -eq 0 ]; then
  echo -e "${BOLD}  ${GREEN}All ${TOTAL} tests passed ✓${RESET}"
else
  echo -e "${BOLD}  ${GREEN}${PASS} passed${RESET}  ${RED}${FAIL} failed${RESET}  /  ${TOTAL} total"
fi
echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

[ "$FAIL" -eq 0 ] && exit 0 || exit 1