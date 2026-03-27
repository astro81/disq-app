import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { API_URL } from '$env/static/private'

export const GET: RequestHandler = async ({ params, url, fetch, cookies }) => {
  const { channelId } = params
  const cursor = url.searchParams.get('cursor')

  const accessToken = cookies.get('access_token')
  if (!accessToken) error(401, 'Unauthorized')

  let apiUrl = `${API_URL}/api/messages/${channelId}`
  
  // Append cursor as a query param if it exists
  if (cursor) {
      const searchParams = new URLSearchParams({ cursor })
      apiUrl += `?${searchParams.toString()}`
  }

  const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
      const errorText = await res.text()
      error(res.status, errorText)
  }

  return json(await res.json())
}