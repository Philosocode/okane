namespace Okane.Api.Infrastructure.RateLimit;

public static class RateLimitAmounts
{
    public const int AuthenticatedUserLimit = 250;
    public const int AnonymousUserLimit = 50;
    public const int GlobalEmailLimit = 6;
    public const int PerEndpointEmailLimit = 3;
}
