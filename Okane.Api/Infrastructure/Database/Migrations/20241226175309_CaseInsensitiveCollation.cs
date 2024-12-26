using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Okane.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class CaseInsensitiveCollation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:CollationDefinition:case_insensitive", "en-u-ks-primary,en-u-ks-primary,icu,False")
                .Annotation("Npgsql:Enum:finance_record_type", "expense,revenue")
                .OldAnnotation("Npgsql:Enum:finance_record_type", "expense,revenue");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:finance_record_type", "expense,revenue")
                .OldAnnotation("Npgsql:CollationDefinition:case_insensitive", "en-u-ks-primary,en-u-ks-primary,icu,False")
                .OldAnnotation("Npgsql:Enum:finance_record_type", "expense,revenue");
        }
    }
}
