/* main hexo */

"use strict";

const url = require("url");
const { version } = require("../../package.json");
const themeVersion = version;

hexo.extend.helper.register("isInHomePaging", (pagePath, route) => {
  if (pagePath.length > 5 && route === "/") {
    return pagePath.slice(0, 5) === "page/";
  }

  return false;
});

/* code block language display */
hexo.extend.filter.register("after_post_render", (data) => {
  const pattern = /<figure class="highlight ([a-zA-Z+\-/#]+)">.*?<\/figure>/g;
  data.content = data.content.replace(pattern, function (match, p1) {
    let language = p1 || "code";
    if (language === "plain") {
      language = "code";
    }
    const replaced = match.replace(
      '<figure class="highlight ',
      '<figure class="iseeu highlight ',
    );
    const container =
      '<div class="highlight-container" data-rel="' +
      language.charAt(0).toUpperCase() +
      language.slice(1) +
      '">' +
      replaced +
      "</div>";
    return container;
  });
  return data;
});

hexo.extend.helper.register("createNewArchivePosts", (posts) => {
  const postList = [],
    postYearList = [];
  posts.forEach((post) => postYearList.push(post.date.year()));
  Array.from(new Set(postYearList)).forEach((year) => {
    postList.push({
      year: year,
      postList: [],
    });
  });
  postList.sort((a, b) => b.year - a.year);
  postList.forEach((item) => {
    posts.forEach(
      (post) => item.year === post.date.year() && item.postList.push(post),
    );
  });
  postList.forEach((item) =>
    item.postList.sort((a, b) => b.date.unix() - a.date.unix()),
  );
  return postList;
});

hexo.extend.helper.register(
  "getAuthorLabel",
  function (postCount, isAuto, labelList) {
    let level = Math.floor(Math.log2(postCount));
    level = level < 2 ? 1 : level - 1;

    if (isAuto === false && Array.isArray(labelList) && labelList.length > 0) {
      return level > labelList.length
        ? labelList[labelList.length - 1]
        : labelList[level - 1];
    } else {
      return `Lv${level}`;
    }
  },
);

hexo.extend.helper.register("getPostUrl", (rootUrl, path) => {
  if (rootUrl) {
    let { href } = new URL(rootUrl);
    if (href.substring(href.length - 1) !== "/") {
      href = href + "/";
    }
    return href + path;
  } else {
    return path;
  }
});

hexo.extend.helper.register("renderJS", (path) => {
  const _js = hexo.extend.helper.get("js").bind(hexo);

  const cdnProviders = {
    staticfile: "https://cdn.staticfile.net/hexo-theme-redefine/:version/:path",
    bootcdn:
      "https://cdn.bootcdn.net/ajax/libs/hexo-theme-redefine/:version/:path",
    sustech:
      "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/hexo-theme-redefine/:version/:path",
    zstatic:
      "https://s4.zstatic.net/ajax/libs/hexo-theme-redefine/:version/:path",
    cdnjs:
      "https://cdnjs.cloudflare.com/ajax/libs/hexo-theme-redefine/:version/:path",
    unpkg: "https://unpkg.com/hexo-theme-redefine@:version/source/:path",
    jsdelivr:
      "https://cdn.jsdelivr.net/npm/hexo-theme-redefine@:version/source/:path",
    aliyun:
      "https://evan.beee.top/projects/hexo-theme-redefine/:version/source/:path",
    npmmirror:
      "https://registry.npmmirror.com/hexo-theme-redefine/:version/files/source/:path",
    custom: this.theme.cdn.custom_url,
  };

  const cdnPathHandle = (path) => {
    const cdnBase =
      cdnProviders[this.theme.cdn.provider] || cdnProviders.staticfile;
    let jsScript;

    if (this.theme.cdn.enable) {
      if (this.theme.cdn.provider === "custom") {
        const customUrl = cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path);
        jsScript = `<script src="${
          this.theme.cdn.enable ? customUrl : _js(path)
        }"></script>`;
      } else {
        jsScript = `<script src="${cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path)}"></script>`;
      }
    } else {
      jsScript = _js(path);
    }

    return jsScript;
  };

  let renderedScripts = "";

  if (Array.isArray(path)) {
    renderedScripts = path.map(cdnPathHandle).join("");
  } else {
    renderedScripts = cdnPathHandle(path);
  }

  return renderedScripts;
});

hexo.extend.helper.register("renderJSModule", (path) => {
  const _js = hexo.extend.helper.get("js").bind(hexo);

  const cdnProviders = {
    staticfile: "https://cdn.staticfile.net/hexo-theme-redefine/:version/:path",
    bootcdn:
      "https://cdn.bootcdn.net/ajax/libs/hexo-theme-redefine/:version/:path",
    sustech:
      "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/hexo-theme-redefine/:version/:path",
    zstatic:
      "https://s4.zstatic.net/ajax/libs/hexo-theme-redefine/:version/:path",
    cdnjs:
      "https://cdnjs.cloudflare.com/ajax/libs/hexo-theme-redefine/:version/:path",
    unpkg: "https://unpkg.com/hexo-theme-redefine@:version/source/:path",
    jsdelivr:
      "https://cdn.jsdelivr.net/npm/hexo-theme-redefine@:version/source/:path",
    aliyun:
      "https://evan.beee.top/projects/hexo-theme-redefine/:version/source/:path",
    npmmirror:
      "https://registry.npmmirror.com/hexo-theme-redefine/:version/files/source/:path",
    custom: this.theme.cdn.custom_url,
  };

  const cdnPathHandle = (path) => {
    const cdnBase =
      cdnProviders[this.theme.cdn.provider] || cdnProviders.staticfile;
    let jsModuleScript;

    if (this.theme.cdn.enable) {
      if (this.theme.cdn.provider === "custom") {
        const customUrl = cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path);
        jsModuleScript = `<script type="module" src="${
          this.theme.cdn.enable ? customUrl : _js({ src: path, type: "module" })
        }"></script>`;
      } else {
        jsModuleScript = `<script type="module" src="${cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path)}"></script>`;
      }
    } else {
      jsModuleScript = _js({ src: path, type: "module" });
    }

    return jsModuleScript;
  };

  let renderedScripts = "";

  if (Array.isArray(path)) {
    renderedScripts = path.map(cdnPathHandle).join("");
  } else {
    renderedScripts = cdnPathHandle(path);
  }

  return renderedScripts;
});

hexo.extend.helper.register("renderJSPath", (path) => {
  const _url_for = hexo.extend.helper.get("url_for").bind(hexo);

  const cdnProviders = {
    staticfile: "https://cdn.staticfile.net/hexo-theme-redefine/:version/:path",
    bootcdn:
      "https://cdn.bootcdn.net/ajax/libs/hexo-theme-redefine/:version/:path",
    sustech:
      "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/hexo-theme-redefine/:version/:path",
    zstatic:
      "https://s4.zstatic.net/ajax/libs/hexo-theme-redefine/:version/:path",
    cdnjs:
      "https://cdnjs.cloudflare.com/ajax/libs/hexo-theme-redefine/:version/:path",
    unpkg: "https://unpkg.com/hexo-theme-redefine@:version/source/:path",
    jsdelivr:
      "https://cdn.jsdelivr.net/npm/hexo-theme-redefine@:version/source/:path",
    aliyun:
      "https://evan.beee.top/projects/hexo-theme-redefine/:version/source/:path",
    npmmirror:
      "https://registry.npmmirror.com/hexo-theme-redefine/:version/files/source/:path",
    custom: this.theme.cdn.custom_url,
  };

  const cdnPathHandle = (path) => {
    const cdnBase =
      cdnProviders[this.theme.cdn.provider] || cdnProviders.staticfile;
    let jsScript;

    if (this.theme.cdn.enable) {
      if (this.theme.cdn.provider === "custom") {
        const customUrl = cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path);
        jsScript = this.theme.cdn.enable ? customUrl : _url_for(path);
      } else {
        jsScript = `${cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path)}`;
      }
    } else {
      jsScript = _url_for(path);
    }

    return jsScript;
  };

  let renderedScripts = "";

  if (Array.isArray(path)) {
    renderedScripts = path.map(cdnPathHandle).join("");
  } else {
    renderedScripts = cdnPathHandle(path);
  }

  return renderedScripts;
});

hexo.extend.helper.register("renderCSS", (path) => {
  const _css = hexo.extend.helper.get("css").bind(hexo);

  const cdnProviders = {
    staticfile: "https://cdn.staticfile.net/hexo-theme-redefine/:version/:path",
    bootcdn:
      "https://cdn.bootcdn.net/ajax/libs/hexo-theme-redefine/:version/:path",
    sustech:
      "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/hexo-theme-redefine/:version/:path",
    zstatic:
      "https://s4.zstatic.net/ajax/libs/hexo-theme-redefine/:version/:path",
    cdnjs:
      "https://cdnjs.cloudflare.com/ajax/libs/hexo-theme-redefine/:version/:path",
    unpkg: "https://unpkg.com/hexo-theme-redefine@:version/source/:path",
    jsdelivr:
      "https://cdn.jsdelivr.net/npm/hexo-theme-redefine@:version/source/:path",
    aliyun:
      "https://evan.beee.top/projects/hexo-theme-redefine/:version/source/:path",
    npmmirror:
      "https://registry.npmmirror.com/hexo-theme-redefine/:version/files/source/:path",
    custom: this.theme.cdn.custom_url,
  };

  const cdnPathHandle = (path) => {
    const cdnBase =
      cdnProviders[this.theme.cdn.provider] || cdnProviders.staticfile;
    let cssLink;

    if (this.theme.cdn.enable) {
      if (this.theme.cdn.provider === "custom") {
        const customUrl = cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path);
        cssLink = `<link rel="stylesheet" href="${customUrl}">`;
      } else {
        cssLink = `<link rel="stylesheet" href="${cdnBase
          .replace(":version", themeVersion)
          .replace(":path", path)}">`;
      }
    } else {
      cssLink = _css(path);
    }

    return cssLink;
  };

  if (Array.isArray(path)) {
    return path.map(cdnPathHandle).join("");
  } else {
    return cdnPathHandle(path);
  }
});

hexo.extend.helper.register("getThemeVersion", function () {
  return themeVersion;
});
