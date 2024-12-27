using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Endpoints;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class PostFinanceUserTagTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;
    private readonly HttpClient _client = apiFactory.CreateClient();

    private void AssertHasExpectedLocation(HttpResponseMessage response, int userTagId)
    {
        var expectedLocation = UrlUtils.GetUriByRouteName(
            _apiFactory,
            FinanceRecordEndpointNames.GetFinanceUserTag,
            new { financeUserTagId = userTagId }
        );

        response.Headers.Location.Should().Be(expectedLocation);
    }

    [Fact]
    public async Task ReturnsCreated_WhenUserTagWithSameNameAndDifferentTypeExists()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        await _client.RegisterAndLogInTestUserAsync();

        // Act.
        var request = new PostFinanceUserTag.Request(tags[0].Name, FinanceRecordType.Revenue);
        var response = await _client.PostAsJsonAsync("/finance-user-tags", request);

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.Created);

        var itemsResponse = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();
        itemsResponse?.Items.Should().ContainSingle();

        var createdUserTag = itemsResponse?.Items[0]!;
        createdUserTag.Tag.Name.Should().Be(tags[0].Name);
        createdUserTag.Type.Should().Be(request.Type);

        AssertHasExpectedLocation(response, createdUserTag.Id);
    }

    [Fact]
    public async Task ReturnsCreated_WhenUserTagWithSameNameAndTypeCreatedByOtherUser()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        var otherUserTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, otherUser.Id);
        await Db.SaveChangesAsync();

        await _client.RegisterAndLogInTestUserAsync();

        // Act.
        var request = new PostFinanceUserTag.Request(tags[0].Name, otherUserTags[0].Type);
        var response = await _client.PostAsJsonAsync("/finance-user-tags", request);

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.Created);

        var itemsResponse = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();
        itemsResponse?.Items.Should().ContainSingle();

        var createdUserTag = itemsResponse?.Items[0]!;
        createdUserTag.Tag.Name.Should().Be(tags[0].Name);
        createdUserTag.Type.Should().Be(request.Type);

        AssertHasExpectedLocation(response, createdUserTag.Id);
    }

    [Fact]
    public async Task ReturnsConflict_WhenUserTagExists()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var userTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, authResponse.User.Id);
        await Db.SaveChangesAsync();

        // Act.
        var request = new PostFinanceUserTag.Request(tags[0].Name, userTags[0].Type);
        var response = await _client.PostAsJsonAsync("/finance-user-tags", request);

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.Conflict);
    }
}
