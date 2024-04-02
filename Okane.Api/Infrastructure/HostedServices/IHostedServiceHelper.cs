namespace Okane.Api.Infrastructure.HostedServices;

public interface IHostedServiceHelper
{
    Task ExecuteAsync(CancellationToken stoppingToken);
}
