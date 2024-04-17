using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Okane.Api.Features.Finances.Entities;

#nullable disable

namespace Okane.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddFinanceRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:finance_record_type", "expense,revenue");

            migrationBuilder.CreateTable(
                name: "FinanceRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    HappenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<FinanceRecordType>(type: "finance_record_type", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinanceRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinanceRecords_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceRecords_UserId",
                table: "FinanceRecords",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FinanceRecords");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:Enum:finance_record_type", "expense,revenue");
        }
    }
}
