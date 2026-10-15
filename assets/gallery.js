/* =====================================================================
 * 作者 / 作品（图片）信息配置 —— 单独模块，便于后期扩展
 * ---------------------------------------------------------------------
 * 新增作者：在 authors 里加一项（key 自定义，供 works.author 引用）
 * 新增作品：在 works 里加一项，key 为 pictures/ 下的文件名
 *
 * 说明：
 *   - 若某个图片未在此登记，页面会自动回退为「文件名解析」：
 *     文件名格式 `作者-作品名.webp`，作者名会在 authors 中按 name 匹配链接。
 *   - works.*.author 既可以是 authors 的 key，也可以直接写 { name, url }。
 * ===================================================================== */
window.GALLERY = {
  // —— 作者表 ——
  authors: {
    miaomiao: {
      name: '@妙啊_老师',
      url: 'https://m.bilibili.com/space/3546859981244551'
    }
    // 例：
    // someone: { name: '@某画师', url: 'https://space.bilibili.com/xxxx' }
  },

  // —— 作品表（key = pictures/ 下的文件名）——
  works: {
    '@妙啊_老师-天依小脚丫.webp': { author: 'miaomiao', title: '天依小脚丫' },
    '@妙啊_老师-泳装天依.webp':   { author: 'miaomiao', title: '泳装天依' }
    // 例：
    // '别的图.webp': { author: 'someone', title: '作品名' }
  }
};
