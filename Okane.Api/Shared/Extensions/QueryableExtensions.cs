using System.Linq.Expressions;

namespace Okane.Api.Shared.Extensions;

public static class QueryableExtensions
{
    /// <summary>
    ///     Sort a query by field and direction.
    /// </summary>
    /// <param name="query"></param>
    /// <param name="keySelector"></param>
    /// <param name="isAscending"></param>
    /// <typeparam name="TSource"></typeparam>
    /// <typeparam name="TKey"></typeparam>
    /// <returns></returns>
    public static IOrderedQueryable<TSource> OrderBySortDirection<TSource, TKey>(
        this IQueryable<TSource> query,
        Expression<Func<TSource, TKey>> keySelector,
        bool isAscending)
    {
        return isAscending
            ? query.OrderBy(keySelector)
            : query.OrderByDescending(keySelector);
    }

    /// <summary>
    ///     Sort a query by another field and direction.
    /// </summary>
    /// <param name="query"></param>
    /// <param name="keySelector"></param>
    /// <param name="isAscending"></param>
    /// <typeparam name="TSource"></typeparam>
    /// <typeparam name="TKey"></typeparam>
    /// <returns></returns>
    public static IOrderedQueryable<TSource> ThenBySortDirection<TSource, TKey>(
        this IOrderedQueryable<TSource> query,
        Expression<Func<TSource, TKey>> keySelector,
        bool isAscending)
    {
        return isAscending
            ? query.ThenBy(keySelector)
            : query.ThenByDescending(keySelector);
    }
}
