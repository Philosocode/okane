using Microsoft.AspNetCore.Identity;

namespace Okane.Api.Features.Auth.Exceptions;

public class IdentityException(string message, IEnumerable<IdentityError> errors)
    : Exception(message)
{
    public IEnumerable<IdentityError> Errors { get; private set; } = errors;
}
