using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Tests.Testing.Integration;

[Collection(nameof(DatabaseTestCollection))]
public abstract class DatabaseTest(TestingApiFactory apiFactory) : IAsyncLifetime
{
    protected readonly ApiDbContext Db = apiFactory.Db;
    
    protected static readonly ApiUser TestUser = new ApiUser
    {
        Email = "test@okane.com",
        Name = "Test User",
    };
    protected const string TestUserPassword = "SuperCoolTestingPassword1234!!!!";

    public Task InitializeAsync() => Task.CompletedTask;
    
    public Task DisposeAsync() => apiFactory.ResetDatabase();
    
    // General helpers.
    protected async Task InsertEntity<T>(T entity) where T : class
    {
        await Db.AddAsync(entity);
        await Db.SaveChangesAsync();
    }
    
    // User helpers.
    protected async Task RegisterTestUser(HttpClient client)
    {
        var request = new Register.Request(TestUser.Name, TestUser.Email!, TestUserPassword);
        await client.PostAsJsonAsync("/auth/register", request);
    }

    protected async Task<AuthenticateResponse?> LogInTestUser(HttpClient client)
    {
        var request = new Login.Request(TestUser.Email!, TestUserPassword);
        var response = await client.PostAsJsonAsync("/auth/login", request);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        return body?.Items[0];
    }
    
    protected async Task<AuthenticateResponse?> RegisterAndLogInTestUser(HttpClient client)
    {
        await RegisterTestUser(client);
        return await LogInTestUser(client);
    }
    
    protected async Task<ApiUser> GetTestUser()
    {
        var testUser = await Db.Users.SingleOrDefaultAsync(u => u.Email == TestUser.Email);
        return testUser ?? TestUser;
    }
}
