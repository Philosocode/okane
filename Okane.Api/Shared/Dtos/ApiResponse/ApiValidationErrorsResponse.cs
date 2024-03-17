namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ApiValidationErrorsResponse
{
    public required IEnumerable<ValidationError> Errors { get; init; }
}

public record ValidationError
{
    public required string Message { get; init; }
    public required string PropertyName { get; init; }
}
