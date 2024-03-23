namespace Okane.Api.Infrastructure.Database.Entities;

/// <summary>
/// Entity that can be owned by a User.
/// </summary>
public interface IOwnedEntity
{
    string UserId { get; }
}
