using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class GetFinanceUserTagsTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsAllFinanceUserTagsCreatedByTheRequestUser()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 3);
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var testUser = authResponse.User;
        var ownUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db,
            tags,
            testUser.Id
        );

        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        FinanceTagUtils.AddFinanceUserTags(Db, [tags[0]], otherUser.Id);

        await Db.SaveChangesAsync();

        // Act.
        var response = await _client.GetAsync("/finance-user-tags");

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var apiResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();

        var expectedUserTags = ownUserTags.Select(fut => fut.ToFinanceUserTagResponse()).ToList();
        apiResponse?.Items.Should().BeEquivalentTo(expectedUserTags);
    }
}
