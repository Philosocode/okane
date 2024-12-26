using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;

namespace Okane.Api.Features.Finances.Mappers;

public static class FinanceUserTagMappers
{
    public static FinanceUserTagResponse ToFinanceUserTagResponse(this FinanceUserTag userTag)
    {
        return new FinanceUserTagResponse
        {
            Id = userTag.Id,
            Tag = userTag.Tag,
            Type = userTag.Type
        };
    }
}
