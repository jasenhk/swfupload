using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace Swfupload.Models
{
    [Serializable]
    public class FileUploadResult
    {
        public string FileName { get; set; }

        public string ToJSON()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}