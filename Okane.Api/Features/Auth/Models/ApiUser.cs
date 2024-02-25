using Microsoft.AspNetCore.Identity;

namespace Okane.Api.Features.Auth.Models;

public class ApiUser : IdentityUser
{
    public string Name { get; set; }
}
