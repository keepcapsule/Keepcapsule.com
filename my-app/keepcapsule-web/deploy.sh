#!/bin/bash

# clean temp clone folder
rm -rf temp-deploy

# clone only latest version
git clone . temp-deploy

# go into it
cd temp-deploy

# switch to orphan gh-pages branch
git checkout --orphan gh-pages

# remove everything
git rm -rf .

# copy build from original project
cp -r ../build/* .

# commit and push to gh-pages branch
git add .
git commit -m "Deploying to gh-pages"
git push origin gh-pages --force

# cleanup
cd ..
rm -rf temp-deploy

echo "🚀 Deployed to GitHub Pages!"
