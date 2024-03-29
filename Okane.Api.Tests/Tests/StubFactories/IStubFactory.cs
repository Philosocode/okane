using Bogus;

namespace Okane.Api.Tests.Tests.StubFactories;

public interface IStubFactory<T> where T : class
{
    static abstract Faker<T> GetFactory();
    static abstract T Create();
}
