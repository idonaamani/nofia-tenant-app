@echo off
cd /d "%~dp0"
echo Uploading changes to GitHub...
git add -A
git commit -m "update %date% %time%"
git push
if errorlevel 1 (
  echo.
  echo ERROR - upload failed. Send a screenshot to Claude.
) else (
  echo.
  echo DONE - uploaded. Netlify will update the site in a few minutes.
)
pause
