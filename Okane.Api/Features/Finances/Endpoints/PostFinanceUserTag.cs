using System.Net;
using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Finances.Endpoints;

public class PostFinanceUserTag : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("", HandleAsync)
            .WithName(FinanceRecordEndpointNames.PostFinanceUserTag)
            .WithSummary("Create a finance user tag.");
    }

    public record Request(string Name, FinanceRecordType Type);

    private static async Task<Results<CreatedAtRoute<ApiResponse<FinanceUserTagResponse>>, Conflict>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            ILogger<PostFinanceUserTag> logger,
            Request request,
            IFinanceTagService tagService,
            IValidator<FinanceRecord> validator,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var userTagAlreadyExists = await db.FinanceUserTags
            .Include(fut => fut.Tag)
            .AnyAsync(
                fut => fut.UserId == userId
                       && fut.Type == request.Type
                       && fut.Tag.Name.Equals(request.Name)
                , cancellationToken);

        if (userTagAlreadyExists)
        {
            return TypedResults.Conflict();
        }

        FinanceUserTag createdUserTag;
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            createdUserTag = await tagService.CreateFinanceUserTagAsync(
                request.Name,
                request.Type,
                userId,
                cancellationToken
            );

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);

            logger.LogWarning(
                "Transaction error: {UserId} {Type} {TagName} {Error}",
                userId, request.Type, request.Name, ex.Message
            );

            throw;
        }

        var response = new ApiResponse<FinanceUserTagResponse>(createdUserTag.ToFinanceUserTagResponse())
        {
            Status = HttpStatusCode.Created
        };

        return TypedResults.CreatedAtRoute(
            response,
            FinanceRecordEndpointNames.GetFinanceUserTag,
            new { financeUserTagId = createdUserTag.Id }
        );
    }
}
