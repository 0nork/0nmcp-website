export interface RedditProfile {
  id: string
  name: string
  icon_img: string
  subreddit?: {
    display_name_prefixed: string
  }
  total_karma: number
  link_karma: number
  comment_karma: number
}

export interface RedditTokens {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token: string
}
