namespace Okane.Api.Tests.Testing.Utils;

public interface ITestService
{
    bool DoSomething();
    Task<bool> DoSomethingAsync();
}

public class TestService : ITestService
{
    public bool DoSomething()
    {
        throw new NotImplementedException();
    }

    public Task<bool> DoSomethingAsync()
    {
        throw new NotImplementedException();
    }
}
