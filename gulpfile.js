const gulp = require("gulp");
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const bump = require("gulp-bump");
const jsonTransform = require("gulp-json-transform");

// Paths
const paths = {
  dist: "dist/", // Final deployable folder
  src: "src/**/*.ts", // All TypeScript files in the src folder
  readme: "README.md", // Readme file
  license: "LICENSE", // License file
  packageJson: "package.json", // Main project package.json
};

// Task to clean the dist directory
gulp.task("clean", () => {
  return gulp.src(paths.dist, { allowEmpty: true, read: false }).pipe(clean());
});

// Task to compile TypeScript files to both JavaScript and .d.ts in the dist directory
gulp.task("build-ts", () => {
  const tsProject = ts.createProject("tsconfig.json", {
    declaration: true, // Generate .d.ts files
    outDir: paths.dist, // Output to dist folder
  });
  return tsProject
    .src()
    .pipe(tsProject()) // Compile TypeScript to JS and .d.ts
    .pipe(gulp.dest(paths.dist)); // Output to dist folder
});

// Task to bump the version in package.json
gulp.task("bump-version", () => {
  return gulp
    .src(paths.packageJson)
    .pipe(bump({ type: "patch" })) // Bump version (can be changed to "major" or "minor")
    .pipe(gulp.dest("./")); // Save the updated package.json
});

// Task to copy and transform package.json to dist, removing unnecessary fields
gulp.task("copy-package-json", () => {
  return gulp
    .src(paths.packageJson)
    .pipe(
      jsonTransform((pkg) => {
        // Remove unnecessary fields for production
        delete pkg.devDependencies;
        delete pkg.scripts;

        return pkg;
      }, 2) // Pretty print JSON with 2 spaces
    )
    .pipe(gulp.dest(paths.dist));
});

// Task to copy necessary assets (README, LICENSE) to dist
gulp.task("copy-assets", () => {
  return gulp
    .src([paths.readme, paths.license], { base: "./" })
    .pipe(gulp.dest(paths.dist));
});

// Main task to clean, build TypeScript, and copy everything to dist
gulp.task(
  "build",
  gulp.series(
    "clean",
    "bump-version",
    "build-ts",
    gulp.parallel("copy-package-json", "copy-assets")
  )
);

// Default task to build the project
gulp.task("default", gulp.series("build"));
