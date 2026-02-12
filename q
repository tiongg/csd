[33me40d4e3[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mfeature/CRUD-team-course-management-kz[m[33m, [m[1;31morigin/dev[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mdev[m[33m)[m Merge pull request #6 from tiongg/feat/authenticated-routes
[33m9b12767[m Merge pull request #5 from tiongg/feat/oauth-login
[33mdf9b7fd[m Merge pull request #7 from tiongg/feat/auth/basic-profile-management
[33mea1b553[m Merge pull request #3 from tiongg/feat/auth/login
[33md489092[m chore: redirect to index on logout
[33mfd4af31[m feat: protect profile route
[33md5f67f1[m feat: protected FE routes
[33m1cdd6fd[m chore: properly log public routes
[33m0397bf6[m feat: implement exchange code flow
[33m5d4d403[m fix: dont login on registration error
[33m1141cc5[m chore: set real name when using google oauth
[33mb0dc164[m chore: add redirect uri to config file
[33m10088ea[m fix: add unique check for same account and provider
[33m96572c0[m refactor: remove dead code + spelling mistakes
[33m08e55d3[m doc: add setup guide for oauth
[33mcbe1d1c[m feat: generate username when first using oauth to login
[33m199ea79[m feat: implement login with oauth
[33m96b9a06[m feat: implement oauth routing
[33m5e98591[m chore: import packages for oauth
[33mf2f402a[m feat: add oauth connections entity
[33m8322afe[m fix: compile error
[33m812c1e7[m chore: use asChild for dropdown link
[33m2909f79[m chore: null check on username update
[33m616cf14[m refactor: move gravatar hash to effect hook
[33m1c463d7[m refactor: make realname nullable
[33m1e47701[m refactor: rename realName to realname
[33m9ea1db8[m feat: basic profile management screen
[33me6ce2f4[m chore: import dropdown menu
[33m6553d8a[m feat: endpoint to update profile
[33mef88596[m chore: return realname in account dto
[33m05f8918[m chore: allow PATCH through cors
[33m6eca499[m chore: move account to query state
[33m040006a[m fix: refresh token even if expired
[33m363b388[m feat: auto refresh token
[33m95f4d9d[m chore: validate login payload
[33m8550b04[m chore: remove query invalidation for user after login
[33m7942f10[m refactor: use refresh token expiry time
[33mfd7fb79[m fix: allow creation of accounts
[33md7145fd[m chore: add values to jwt setting
[33m93c54c4[m refactor: move auth cookie generation to its own function
[33m68113c3[m feat: add decorator to allow individual public routes
[33mce0703c[m feat: FE login form
[33mbda4d47[m feat: add jwt authentication endpoints
[33m31bbed6[m Merge pull request #2 from tiongg/feat/auth/registration
[33m95a051e[m doc: update documentation for OkResponse usage
[33m2f59125[m chore: add nvmrc
[33m8e8e56e[m feat: validate account creation input
[33m9402378[m fix: check for duplicate email before inserting into db
[33m4dc1949[m chore: update java formatter
[33mc3e57fc[m chore: remove unused "use client"
[33m532d12e[m feat: hash password before storing
[33m564d2ef[m chore: add spring security
[33m89a8b35[m feat: registration form
[33mae3362f[m fix: invert check for username existence
[33m448fe70[m chore: install form packages
[33m4b5ed97[m refactor: rename auth schema to accounts
[33m89b7177[m chore: add decorators to document errors
[33mbad0eae[m feat: api for creating accounts
[33mb9800d0[m feat: add account entity
[33m4c075f4[m fix: hook BE to push changes to FE schema instead
[33me5173b1[m chore: set default cors frontend url
[33m0ca21fa[m chore: disable auto restart on pgadmin
[33md7de2ab[m fix: db healthcheck spam
[33m7e442c4[m fix: add healthcheck for flyway
[33m4a60191[m doc: setup guide
[33m1b5a641[m doc: add pull request template
[33mea0a6af[m Merge pull request #1 from tiongg/ci/backend
[33m0a9b926[m chore: remove ci branch from running ci
[33m0782aed[m chore: cleanup dockerfile
[33m5d90ab6[m ci: share docker network with builder
[33m9d2bec8[m ci: fix flyway image
[33mb5aa2a1[m ci: test BE build
[33mc0249b3[m chore: re-generate api spec when updating backend
[33m1cdd14d[m feat: simple account crud
[33mbf21aeb[m fix: map pojos into record dtos
[33mfbd2ad2[m feat: generate BE endpoint schema
[33m7e55517[m doc: add swagger
[33m84bcd47[m chore: move cors setting to env var
[33m5191932[m fix: map to pojo when returning records
[33m8145f01[m feat: setup react frontend
[33m65c62c9[m chore: add pgadmin to docker compose
[33m7381289[m feat: very basic crud with db
[33m40f921f[m feat: initalize spring boot app
