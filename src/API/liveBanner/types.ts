export type LiveBannerType = {
    'id': number,
    'name': string,
    'avatar_url': string,
    'bio': string,
    'ban_time': string,
}

export type LiveBannerData = {
    'message': string,
    'banned_users': LiveBannerType[],
    'total': number,
    'pages': number,
    'current_page': number
}