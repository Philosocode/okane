using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests.Testing.Extensions;

public static class ServiceCollectionExtensions
{
    public static void RemoveDbContext(this IServiceCollection services)
    {
        ServiceDescriptor? descriptor = services.SingleOrDefault(
            d => d.ServiceType == typeof(DbContextOptions<ApiDbContext>)
        );
        if (descriptor != null)
        {
            services.Remove(descriptor);
        }
    }

    public static void EnsureDbCreated(this IServiceCollection services)
    {
        using IServiceScope scope = services.BuildServiceProvider().CreateScope();
        IServiceProvider serviceProvider = scope.ServiceProvider;
        var context = serviceProvider.GetRequiredService<ApiDbContext>();
        context.Database.EnsureCreated();
    }
}
