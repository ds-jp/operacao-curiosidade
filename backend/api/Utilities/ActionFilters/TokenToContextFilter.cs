using api.Data.Repositories.Interfaces;
using api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace api.Utilities.ActionFilters
{
    public class TokenToContextFilter : IAsyncActionFilter
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;

        public TokenToContextFilter(IAuthService authService, IUserRepository userRepository)
        {
            _authService = authService;
            _userRepository = userRepository;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var authorizationHeader = context.HttpContext.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
            {
                var token = authorizationHeader["Bearer ".Length..].Trim();

                var userEmail = _authService.DecodeToken(token);
                var user = _userRepository.GetUserByEmail(userEmail);

                context.HttpContext.Items["UserId"] = user.Id;
                context.HttpContext.Items["UserEmail"] = user.Email;
                context.HttpContext.Items["Token"] = token;
            }

            await next();
        }
    }
}
