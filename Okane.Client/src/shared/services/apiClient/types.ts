export interface APIResponse<TItem = unknown> {
  items: TItem[]
  status: number
}

export interface APIPaginatedResponse<TItem = unknown> extends APIResponse<TItem> {
  hasNextPage: boolean
}

// See: https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.problemdetails?view=aspnetcore-8.0#properties
export interface ProblemDetails {
  status: number

  // Human-readable details about the problem.
  detail: string

  // Short, human-readable summary of the problem. Should be consistent across instances of the problem.
  title: string

  // URI identifying the problem type.
  type: string

  // Dictionary where keys are property names and values are the errors associated with the
  // property name.
  errors?: Record<string, string[]>

  // URI identifying the specific occurrence of the problem.
  instance?: string
}
