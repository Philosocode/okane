using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Okane.Api.Features.Auth.Extensions;

namespace Okane.Api.Tests.Features.Auth.Extensions;

public class ClaimsPrincipalExtensionsTests
{
    public class GetUserId
    {
        private readonly string _authenticationType = JwtBearerDefaults.AuthenticationScheme;
        private readonly string _userId = "cool-user-id";

        [Fact]
        public void ReturnsUserId_WhenAuthenticated()
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, _userId)
            };

            var claimsIdentity = new ClaimsIdentity(claims, _authenticationType);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            var actualId = claimsPrincipal.GetUserId();
            actualId.Should().Be(_userId);
        }

        [Fact]
        public void Throws_WhenNotAuthenticated()
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, _userId)
            };

            var claimsIdentity = new ClaimsIdentity(claims, null);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            Action result = () => claimsPrincipal.GetUserId();
            result.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Throws_WhenTheNameIdentifierClaimIsMissing()
        {
            var claimsIdentity = new ClaimsIdentity([], _authenticationType);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            Action result = () => claimsPrincipal.GetUserId();
            result.Should().Throw<InvalidOperationException>();
        }
    }
}
