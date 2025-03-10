export interface LiveModeratorType{
    'id': number,
    'user_id': number,
    'name': string,
    'avatar_url': string,
    'created_at': string
}

export interface LiveModeratorListType{
    'message': string,
    'moderators': LiveModeratorType[],
    'total': number,
    'pages': number,
    'current_page': number
}
