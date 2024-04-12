using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Okane.Api.Infrastructure.Database.Constants;

namespace Okane.Api.Features.Auth.Entities;

public class ApiUser : IdentityUser
{
    [MaxLength(DbConstants.MaxStringLength)]
    public required string Name { get; set; }

    [JsonIgnore]
    public ICollection<RefreshToken> RefreshTokens { get; set; } = default!;
}
