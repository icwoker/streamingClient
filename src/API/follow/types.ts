export interface getFollowerCount{
    'fans_count': number,
    'follows_count': number
}

export interface followerType{
  'id': number,
  'name': string,
  'avatar_url': string,
  'bio': string,
  'follow_time': string
}

export interface followData{
    'message': string,
    'follows': followerType[],
    'total': number,
    'pages': number,
    'current_page': number
}

export interface followStatus{
    'is_following': boolean
}

