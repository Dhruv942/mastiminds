# Private Assets (Secure Storage)

Yahan ki images browser mein direct URL se accessible nahi hongi.

- `images/` – Game images (space_red, space_blue, missile_red, missile_blue, explode, etc.)
- API route `/api/asset/[name]` se serve hoti hain
- Naye images add karne ke liye: file yahan rakho + `app/api/asset/[name]/route.ts` ki ALLOWED list mein naam add karo
