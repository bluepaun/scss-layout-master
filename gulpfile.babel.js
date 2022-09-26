import gulp from "gulp";
import { deleteSync } from "del";
import gpug from "gulp-pug";
import ws from "gulp-webserver";
import gulp_image from "gulp-image";
import minify from "gulp-csso";
import gulpSass from "gulp-sass";
import sass2 from "sass";
import autoprefixer from "gulp-autoprefixer";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

const sass = gulpSass(sass2);

const todayChallenge = "challenge/22-09-26";

const routes = {
    pug: {
        watch: "src/**/*.pug",
        src: "src/*.pug",
        dest: "build/",
    },
    css: {
        watch: "src/scss/**/*",
        src: "src/scss/style.scss",
        dest: "build/css",
    },
    img: {
        watch: "src/img/*",
        src: "src/img/*",
        dest: "build/img",
    },
    js: {
        watch: "src/js/**/*",
        src: "src/js/main.js",
        dest: "build/js",
    },
    cPug: {
        watch: `${todayChallenge}/**/*.pug`,
        src: `${todayChallenge}/*.pug`,
        dest: `${todayChallenge}/build`,
    },
    cCss: {
        watch: `${todayChallenge}/scss/**/*`,
        src: `${todayChallenge}/scss/style.scss`,
        dest: `${todayChallenge}/build/css`,
    },
};

const styles = () =>
    gulp
        .src(routes.css.src)
        .pipe(sass().on("error", sass.logError))
        .pipe(
            autoprefixer({
                flexbox: true,
                grid: "autoplace",
            })
        )
        .pipe(minify())
        .pipe(gulp.dest(routes.css.dest));

const clean = async () => await deleteSync(["build/"]);
const cleanPublish = async () => await deleteSync([".publish"]);

const pug = () => {
    return gulp
        .src(routes.pug.src)
        .pipe(gpug())
        .pipe(gulp.dest(routes.pug.dest));
};

const img = () => {
    return gulp
        .src(routes.img.src)
        .pipe(gulp_image())
        .pipe(gulp.dest(routes.img.dest));
};

const js = () =>
    gulp
        .src(routes.js.src)
        .pipe(
            bro({
                transform: [
                    babelify.configure({ presets: ["@babel/preset-env"] }),
                    ["uglifyify", { global: true }],
                ],
            })
        )
        .pipe(gulp.dest(routes.js.dest));

const webServer = () => gulp.src("build").pipe(ws({ livereload: true }));

const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.css.watch, styles);
    // gulp.watch(routes.img.watch, img);
    gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean]);
const assets = gulp.series([pug, styles, js]);
const posDev = gulp.parallel([webServer, watch]);

const gitdeploy = () => gulp.src("build/**/*").pipe(ghPages());

export const build = gulp.series([prepare, img, assets]);
export const dev = gulp.series([build, posDev]);
export const deploy = gulp.series([build, gitdeploy, cleanPublish]);

const cClean = async () => await deleteSync([`${todayChallenge}/build/`]);
const cPug = () =>
    gulp
        .src(routes.cPug.src)
        .pipe(gpug({ pretty: true }))
        .pipe(gulp.dest(routes.cPug.dest));
const cCss = () =>
    gulp
        .src(routes.cCss.src)
        .pipe(sass().on("error", sass.logError))
        .pipe(
            autoprefixer({
                flexbox: true,
                grid: "autoplace",
            })
        )
        .pipe(gulp.dest(routes.cCss.dest));
const cWebServer = () =>
    gulp.src(`${todayChallenge}/build`).pipe(ws({ livereload: true }));
const cWatch = () => {
    gulp.watch(routes.cPug.watch, cPug);
    gulp.watch(routes.cCss.watch, cCss);
};

const cBuild = gulp.series([cClean, cPug, cCss]);

export const challenge = gulp.series([cBuild, cWebServer, cWatch]);
