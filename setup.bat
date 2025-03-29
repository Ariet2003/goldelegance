@echo off
echo Installing Node.js dependencies...
npm install

echo Initializing Prisma...
npx prisma generate
npx prisma db push

echo Setup completed! 