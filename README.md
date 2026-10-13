# choukaguya.cn

超时空辉夜姬同人收集站 | Unofficial fan works archive for *Cosmic Princess Kaguya* (超かぐや姫!)

**本站为非官方粉丝同人站，与官方无关。所有相关角色与作品的著作权归原权利人所有。**

## 定位

- 主：tag 检索型同人作品收集广场（booru 形态：搜索＋tag＋自动补全＋评论互动）
- 次：资料站（角色／设定／音乐，轻量）
- 冷启动：收录制＋原作者授权声明

## 技术栈

Next.js (App Router) + TypeScript + Tailwind + PostgreSQL + Prisma，Docker Compose 部署，Caddy 反代自动 HTTPS。

## 部署

```bash
cp .env.example .env  # 填入实际值
docker compose up -d
```

## License

代码 MIT。用户上传内容的权利归原作者。
