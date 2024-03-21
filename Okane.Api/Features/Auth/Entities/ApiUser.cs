using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Okane.Api.Features.Auth.Entities;

public class ApiUser : IdentityUser
{
    [MaxLength(256)]
    public required string Name { get; set; }
    
    [JsonIgnore]
    public ICollection<RefreshToken> RefreshTokens { get; set; }  = default!;
}
