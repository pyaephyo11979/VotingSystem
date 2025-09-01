package org.example.apibridge.dto.response;

public record StandardResponse<T>(boolean success, T data, ApiError error) {
    public static <T> StandardResponse<T> ok(T data){
        return new StandardResponse<>(true, data, null);
    }
    public static <T> StandardResponse<T> fail(String code, String message){
        return new StandardResponse<>(false, null, new ApiError(code, message));
    }
}
