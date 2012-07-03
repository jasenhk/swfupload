using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Swfupload
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );

        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
        }

        protected void Session_Start()
        {
        }

        // This is necessary because some 3rd party code cannot access the browser's
        // cookies. This will use the known sessionID to restore the session variables
        // for what would otherwise be a new session (which would lose session state).
        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var context = HttpContext.Current;

            // look in the query string for the flag, otherwise don't even try to reset the session
            if (context.Request.QueryString["-flashSession"] != null)
            {
                // embed the sessionID in a hidden form element
                string sessionId = context.Request.Form["sessionId"];

                if (sessionId != null)
                {
                    HttpCookie cookie = context.Request.Cookies.Get("ASP.NET_SessionId");
                    if (cookie == null)
                    {
                        cookie = new HttpCookie("ASP.NET_SessionId");
                    }
                    cookie.Value = sessionId;
                    context.Request.Cookies.Set(cookie);
                }
            }
        }

    }
}