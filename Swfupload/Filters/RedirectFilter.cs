using System.Web.Mvc;

namespace Swfupload
{
    public class RedirectFilter : ActionFilterAttribute, IActionFilter
    {
        public string Controller { get; set; }
        public string Action { get; set; }

        #region IActionFilter Members

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var controller = filterContext.Controller;
            filterContext.Result = new RedirectToRouteResult(new System.Web.Routing.RouteValueDictionary { { "controller", this.Controller }, { "action", this.Action } });
            System.Diagnostics.Debug.WriteLine("Redirect Filter {0}/{1}", this.Controller, this.Action);
        }

        #endregion
    }
}