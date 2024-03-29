using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Okane.Api.Features.Auth.Mappers;

namespace Okane.Api.Tests.Features.Auth.Mappers;

public class IdentityResultMappersTests
{
    public class ToErrorDictionary()
    {
        [Fact]
        public void ReturnsAnErrorDictionary_WhenThereAreErrors()
        {
            var identityResult = IdentityResult.Failed(
                [
                    new IdentityError
                    {
                        Code = "1",
                        Description = "1A"
                    },
                    new IdentityError
                    {
                        Code = "1",
                        Description = "1B"
                    },
                    new IdentityError
                    {
                        Code = "2",
                        Description = "2"
                    },
                ]
            );

            var actual = identityResult.ToErrorDictionary();
            var expected = new Dictionary<string, string[]>
            {
                { "1", ["1A", "1B"] },
                { "2", ["2"] }
            };
            actual.Should().BeEquivalentTo(expected);
        }
        
        [Fact]
        public void Throws_WhenThereAreNoErrors()
        {
            var identityResult = IdentityResult.Success;
            identityResult
                .Invoking(r => r.ToErrorDictionary())
                .Should().Throw<ArgumentException>();
        }
    }
}
