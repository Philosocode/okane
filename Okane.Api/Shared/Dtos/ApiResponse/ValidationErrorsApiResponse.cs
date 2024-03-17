namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ValidationErrorsApiResponse : ApiResponse<object>
{
    public required IEnumerable<ValidationError> Errors { get; init; }
}

public record ValidationError
{
    public required string PropertyName { get; init; }

    public required string Message { get; init; }
}
