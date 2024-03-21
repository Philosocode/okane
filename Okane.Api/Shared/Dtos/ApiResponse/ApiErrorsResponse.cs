namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ApiErrorsResponse : ApiResponse<object>
{
    public ApiErrorsResponse(string errorMessage)
    {
        var error = new ApiResponseError { Message = errorMessage };
        Errors = [error];
    }

    public ApiErrorsResponse(ApiResponseError error)
        => Errors = [error];

    public ApiErrorsResponse(IEnumerable<ApiResponseError> errors)
        => Errors = errors;
}
