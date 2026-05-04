
export function apiResponse(
    message: string,
    data: any = null,
    success = true
){
    return {
        success,
        message,
        data,
    }
}