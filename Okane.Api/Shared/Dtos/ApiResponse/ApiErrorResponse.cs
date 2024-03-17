namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ApiErrorResponse
{
    public required string Error { get; init; }
}
