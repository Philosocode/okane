using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NpgsqlTypes;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database.Constants;
using Okane.Api.Infrastructure.Database.Entities;

namespace Okane.Api.Features.Finances.Entities;

public class FinanceRecord : IOwnedEntity
{
    public int Id { get; set; }

    [Precision(9, 2)]
    public required decimal Amount { get; set; }

    [MaxLength(DbConstants.MaxStringLength)]
    public required string Description { get; set; }

    public NpgsqlTsVector SearchVector { get; set; } = default!;

    public required DateTime HappenedAt { get; set; }

    public required FinanceRecordType Type { get; set; }

    // Navigation.
    public string UserId { get; set; } = string.Empty;
    public ApiUser User { get; set; } = default!;
}

public class FinanceRecordEntityConfiguration : IEntityTypeConfiguration<FinanceRecord>
{
    public void Configure(EntityTypeBuilder<FinanceRecord> builder)
    {
        builder
            .HasGeneratedTsVectorColumn(
                fr => fr.SearchVector,
                "english",
                fr => new { fr.Description }
            )
            .HasIndex(fr => fr.SearchVector)
            .HasMethod("GIN");

        builder.Property<DateTime>("CreatedAt")
            .HasDefaultValueSql("NOW()");
    }
}
