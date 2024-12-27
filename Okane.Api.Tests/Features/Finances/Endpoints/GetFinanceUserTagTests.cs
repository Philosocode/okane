using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class GetFinanceUserTagTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsOk_WhenUserTagCreatedByTheRequestUser()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var ownUserTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, authResponse.User.Id);
        await Db.SaveChangesAsync();

        // Act.
        var response = await _client.GetAsync($"/finance-user-tags/{ownUserTags[0].Id}");

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var apiResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();

        apiResponse?.Items[0].Id.Should().Be(ownUserTags[0].Id);
    }

    [Fact]
    public async Task ReturnsNotFound_WhenUserTagDoesNotExist()
    {
        // Arrange.
        await _client.RegisterAndLogInTestUserAsync();

        // Act.
        var response = await _client.GetAsync("/finance-user-tags/999");

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReturnsNotFound_WhenUserTagCreatedByAnotherUser()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        var otherUserTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, otherUser.Id);
        await Db.SaveChangesAsync();

        await _client.RegisterAndLogInTestUserAsync();

        // Act.
        var response = await _client.GetAsync($"/finance-user-tags/{otherUserTags[0].Id}");

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }
}
