var serverUrl = "http://localhost:8090/api/";
var discoveryUrl = serverUrl + "discovery";
var mvnUrl = serverUrl + "mvn";
var gitUrl = serverUrl + "git";

$(document).ready(function () {

    var MAVEN_BUILD_SUCCESS = "Maven build success";
    var MAVEN_BUILD_FAIL = "Maven build fail";
    var MAVEN_INVOKER_FAILURE = "Maven invoker failed";
    var INVALID_MVN_MODULE_PATH = "Invalid maven module path";
    var UNSUPPORTED_OPERATING_SYSTEM = "Unsupported operating system";
    var MAVEN_PATH_NOT_FOUND_IN_PATH_VARIABLE = "Maven not found in path variable";
    var GIT_PULL_FAILED = "Git pull failed";
    var GIT_PULL_SUCCESS = "Git pull executed successfully";
    var GIT_NO_REMOTE_TRACKING_OF_BRANCH = "Returned null, likely no remote tracking of branch";
    var GIT_REPOSITORY_NO_REMOTE_ORIGIN_FOUND_IN_THE_LOCAL_CONFIG = "No remote origin found in the local git config file";
    var GIT_ERROR_WHILE_UPDATING_REPOSITORY = "Error while updating the repository";
    var ERROR_BUILDING_GIT_INSTANCE = "Error while building a Git instance";
    var GIT_REPOSITORY_IS_UP_TO_DATE = "Git repository is up to date with origin";
    var GIT_REPOSITORY_IS_AHEAD_OF_ORIGIN = "Git repository is ahead origin";
    var GIT_REPOSITORY_IS_AHEAD_OF_ORIGIN_BUTTON_NAME = "Ahead of origin";
    var GIT_REPOSITORY_IS_BEHIND_ORIGIN = "Git repository is behind origin";
    var ERROR_WHILE_STASHING_CHANGES = "Error while stashing the changes";
    var ERROR_WHILE_CHECKING_BRANCH_STATUS = "Error while checking the status";
    var ERROR_FETCHING_INVALID_REMOTE = "Error while fetching remote branches. Invalid remote.";
    var NO_MAVEN_MODULES_AND_NO_GIT_REPOSITORIES_FOUND = "No maven modules and no git repositories found";
    var ERROR_FETCHING_TRANSPORT_FAILED = "Error while fetching remote branches. Transport operation failed, likely due to an authentication issue.";
    var ERROR_CONNECTING_TO_REMOTE_REPOSITOY_AUTHENTICATION_IS_REQUIRED = "Error while connecting to remote repository. Authentication is required.";
    var ERROR_CONNECTING_TO_REMOTE_REPOSITOY_AUTH_FAIL = "Auth fail.";
    var ERROR_FETCHING_GITAPI_EXCEPTION = "Error while fetching remote branches. GIT API exception.";
    var GLYPH_SUCCESS = "glyph-success";
    var GLYPH_FAILURE = "glyph-failure";
    var TOOL_TIP_CLICK_TO_RE_CHECK = "Click to re-check!";
    var GIT_UNKNOWN_BUTTON_NAME = "Unknown";
    var GIT_UP_TO_DATE_BUTTON_NAME = "Up to date";
    var GIT_OUT_OF_DATE_BUTTON_NAME = "Out of date";
    var BTN_WARNING ='btn-warning';
    var BTN_SUCCESS ='btn-success';
    var BTN_INFO ='btn-info';
    var BTN_DANGER ='btn-danger';
    var BTN_DEFAULT ='btn-default';

    var gitRepositoriesGlobal;

    // initialize all tooltips -- NOT WORKING
    $("[data-toggle=tooltip]").tooltip();


    /* ------------------- Directory discovery related code ------------------- */

    $("#directory-to-search-submit-button").on("click", function () {
        $.ajax({
            url: discoveryUrl,
            type: "GET",
            data: {
                directoryToSearch: $("#directory-to-search-input").val()
            },

            statusCode: {
                200: function (result) {
                    if ((result.Git_repositories.length === 0) || (result.Maven_modules.length === 0)) {
                        removeExistingMessage();
                        displayErrorMessage(NO_MAVEN_MODULES_AND_NO_GIT_REPOSITORIES_FOUND);
                        removeDiscoveredDirectories();
                    } else {
                        removeExistingMessage();
                        gitRepositoriesGlobal = result.Git_repositories;
                        displayRepositories(result.Git_repositories);
                        displayMavenModules(result.Maven_modules);

                        // trigger git up to date check for repositories
                        checkIfRepositoriesAreUpToDate("", "");
                    }
                },
                202: function (result) {
                    removeExistingMessage();
                    displayErrorMessage(result.responseText);
                    removeDiscoveredDirectories();
                },
                400: function (result) {
                    removeExistingMessage();
                    displayErrorMessage(result.responseText);
                    removeDiscoveredDirectories();
                }
            }
        });
    });

    function displayRepositories(gitRepositories) {
        var $gitRepositoriesSelector = $("#git-repositories");

        $gitRepositoriesSelector.html(""); //clear the existing repository list

        if (gitRepositories === null) {
            $gitRepositoriesSelector.append("<p>Git repositories</p> No repositories found");
        } else {
            $gitRepositoriesSelector.append(
                "<h3>Git repositories</h3>" +
                "<table class=\"table table-bordered table-hover\">" +
                "<thead>" +
                "<tr>" +
                "<th>#</th>" +
                "<th>Repository</th>" +
                "<th>Status</th>" +
                "</tr>" +
                "</thead>" +
                "<tbody id=\"git-repositories-list\">" +
                "</tbody>" +
                "</table>");
            for (var i = 0; i < gitRepositories.length; i++) {
                $("#git-repositories-list").append(
                    "<tr>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + gitRepositories[i].name + "</td>" +
                    "<td>" +
                    getDefaultLoadingAnimation(gitRepositories[i]) +
                    "</td>" +
                    "</tr>"
                );
            }
        }
    }

    function displayMavenModules(mvnModules) {
        var $mvnModulesSelector = $("#maven-modules");

        $mvnModulesSelector.html(""); //clear the existing repository list

        if (mvnModules === null) {
            $mvnModulesSelector.append("<p>Maven modules</p> No maven modules found");
        } else {
            $mvnModulesSelector.append(
                "<h3>Maven modules</h3>" +
                "<table class=\"table table-bordered table-hover\">" +
                "<thead>" +
                "<tr>" +
                "<th>#</th>" +
                "<th>Maven module</th>" +
                "<th>Status</th>" +
                "</tr>" +
                "</thead>" +
                "<tbody id=\"maven-modules-list\">" +
                "</tbody>" +
                "</table>");
            for (var i = 0; i < mvnModules.length; i++) {
                $("#maven-modules-list").append(
                    "<tr>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + mvnModules[i].name + "</td>" +
                    "<td>" +
                    "<button type=\"button\" class=\"btn btn-primary btn-xs mvn-update-button\" " +
                    "id=\"maven-module-" + mvnModules[i].name + "\" " +
                    "name=\"" + mvnModules[i].name + "\" " +
                    "path=\"" + mvnModules[i].path + "\" " +
                    "data-toggle=\"tooltip\" " +
                    "data-placement=\"right\" " +
                    "data-loading-text=\"<i class='fa fa-spinner fa-spin '></i>Building...\"" +
                    "title=\"Click to build. No tests!\">" +
                    "Build" +
                    "</button>" +
                    "</td>" +
                    "</tr>"
                );
            }
        }

    }

    $("#directory-to-search-input").keyup(function (event) {
        if (event.keyCode === 13) {
            $("#directory-to-search-submit-button").click();
        }
    });

    function removeDiscoveredDirectories() {
        if ($("#git-repositories-holder") !== null) {
            $("#git-repositories").html("");
        }
        if ($("#maven-modules") !== null) {
            $("#maven-modules").html("");
        }
    }

    function getGitRepositoryStatus(gitRepository) {
        switch (gitRepository.status) {
            case GIT_REPOSITORY_IS_AHEAD_OF_ORIGIN:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_REPOSITORY_IS_AHEAD_OF_ORIGIN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_INFO) + createGlyphIcon(GIT_REPOSITORY_IS_AHEAD_OF_ORIGIN, GLYPH_SUCCESS);
            case GIT_REPOSITORY_IS_UP_TO_DATE:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UP_TO_DATE_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_SUCCESS) + createGlyphIcon(GIT_REPOSITORY_IS_UP_TO_DATE, GLYPH_SUCCESS);
            case GIT_REPOSITORY_IS_BEHIND_ORIGIN:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_OUT_OF_DATE_BUTTON_NAME,
                        "Click to update!",
                        BTN_DANGER) + createGlyphIcon(GIT_REPOSITORY_IS_BEHIND_ORIGIN, GLYPH_FAILURE);
            case GIT_NO_REMOTE_TRACKING_OF_BRANCH:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DEFAULT) + createGlyphIcon(GIT_NO_REMOTE_TRACKING_OF_BRANCH, GLYPH_FAILURE);
            case GIT_REPOSITORY_NO_REMOTE_ORIGIN_FOUND_IN_THE_LOCAL_CONFIG:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DEFAULT) + createGlyphIcon(GIT_REPOSITORY_NO_REMOTE_ORIGIN_FOUND_IN_THE_LOCAL_CONFIG, GLYPH_FAILURE);
            case ERROR_WHILE_STASHING_CHANGES:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DEFAULT) + createGlyphIcon(ERROR_WHILE_STASHING_CHANGES, GLYPH_FAILURE);
            case ERROR_FETCHING_INVALID_REMOTE:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DEFAULT) + createGlyphIcon(ERROR_FETCHING_INVALID_REMOTE, GLYPH_FAILURE);
            case ERROR_FETCHING_TRANSPORT_FAILED:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DEFAULT) + createGlyphIcon(ERROR_FETCHING_TRANSPORT_FAILED, GLYPH_FAILURE);
            case ERROR_FETCHING_GITAPI_EXCEPTION:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DEFAULT) + createGlyphIcon(ERROR_FETCHING_GITAPI_EXCEPTION, GLYPH_FAILURE);
            case ERROR_CONNECTING_TO_REMOTE_REPOSITOY_AUTHENTICATION_IS_REQUIRED:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DEFAULT) + createGlyphIcon(ERROR_CONNECTING_TO_REMOTE_REPOSITOY_AUTHENTICATION_IS_REQUIRED, GLYPH_FAILURE);
            case GIT_PULL_SUCCESS:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UP_TO_DATE_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_SUCCESS) + createGlyphIcon(GIT_PULL_SUCCESS, GLYPH_SUCCESS);
            case GIT_PULL_FAILED:
                return createGitButton(gitRepository.name,
                        gitRepository.path,
                        GIT_UNKNOWN_BUTTON_NAME,
                        TOOL_TIP_CLICK_TO_RE_CHECK,
                        BTN_DANGER) + createGlyphIcon(GIT_PULL_FAILED, GLYPH_FAILURE);
        }
    }

    function createGitButton(repositoryName, repositoryPath, buttonName, toolTip, buttonClass) {

        return "<button type=\"button\" class=\"btn " + buttonClass + " btn-xs git-update-button git-button-fixed-width \" " +
            "id=\"git-repository-" + repositoryName + "\" " +
            "name=\"" + repositoryName + "\" " +
            "path=\"" + repositoryPath + "\" " +
            "data-toggle=\"tooltip\" " +
            "data-placement=\"right\" " +
            "data-loading-text=\"<i class='fa fa-spinner fa-spin '></i>Checking...\"" +
            "title=\"" + toolTip + "\">" +
            buttonName +
            "</button>";
    }

    function getDefaultLoadingAnimation(gitRepository) {
        return "<span>&nbsp;&nbsp;<img src=\"./img/ajax-loader-red.gif\"" +
            "id=\"git-repository-img-" + gitRepository.name + "\" " +
            "name=\"" + gitRepository.name + "\" " +
            "path=\"" + gitRepository.path + "\" " +
            "data-toggle=\"tooltip\" " +
            "data-placement=\"right\" " +
            "title=\"Pending status check!\"></span>";
    }

    function checkIfRepositoriesAreUpToDate(username, password) {
        for (var i = 0; i < gitRepositoriesGlobal.length; i++) {
            checkIfRepositoryIsUpToDate(gitRepositoriesGlobal[i], username, password);
        }
    }

    function checkIfRepositoryIsUpToDate(gitRepository, username, password) {
        $("#git-repository-img-" + gitRepository.name).attr("src", "./img/ajax-loader-red.gif");

        $.ajax({
            url: gitUrl,
            type: "GET",
            data: {
                repositoryPath: gitRepository.path,
                username: username,
                password: password
            },

            statusCode: {
                200: function (result) {
                    var $gitRepositorySelector = $("#git-repository-img-" + result.name);
                    $gitRepositorySelector.before(getGitRepositoryStatus(result));
                    $gitRepositorySelector.remove();
                },
                202: function (result) {
                    if (result.status === ERROR_CONNECTING_TO_REMOTE_REPOSITOY_AUTHENTICATION_IS_REQUIRED) {
                        // display a pop up asking for credentials (username and password)
                        // The following repository requires authentication. Please provide a username and password
                        var $credentialsPopUp = $('#credential-provider-pop-up');
                        if (!$('#ssh-passphrase-pop-up').hasClass('in')) {
                            // only display credential provider modal if the ssh modal is not displayed
                            $('.modal-title').html("\"" + gitRepository.name + "\" repository credentials");
                            $credentialsPopUp.modal('show');
                            $credentialsPopUp.attr('gitRepositoryName', gitRepository.name);
                            $credentialsPopUp.attr('gitRepositoryPath', gitRepository.path);
                            $credentialsPopUp.attr('gitRepositoryStatus', gitRepository.status);
                        }
                    } else if (result.status === ERROR_CONNECTING_TO_REMOTE_REPOSITOY_AUTH_FAIL) {
                        // display a pop up asking for credentials (ssh passphrase)
                        // The following repository requires authentication. Please provide a username and password
                        if (!$('#credential-provider-pop-up').hasClass('in')) {
                            // only display ssh modal if the credential provider modal is not displayed
                            var $sshPassphrasePopUp = $('#ssh-passphrase-pop-up');
                            $('.modal-title').html("\"" + gitRepository.name + "\" requires the ssh passphrase");
                            $sshPassphrasePopUp.modal('show');
                            $sshPassphrasePopUp.attr('gitRepositoryName', gitRepository.name);
                            $sshPassphrasePopUp.attr('gitRepositoryPath', gitRepository.path);
                            $sshPassphrasePopUp.attr('gitRepositoryStatus', gitRepository.status);
                        }
                    } else {
                        var $gitRepositorySelector = $("#git-repository-img-" + result.name);
                        $gitRepositorySelector.before(getGitRepositoryStatus(result));
                        $gitRepositorySelector.remove();
                    }
                },
                400: function (result) {
                    //TODO

                }
            }
        });
    }

    $('#ssh-passphrase-pop-up-ok-btn').on("click", function () {
        var $sshPassphrasePopUp = $('#ssh-passphrase-pop-up');
        var password = $('#ssh-passphrase-pop-up-password').val();

        $sshPassphrasePopUp.modal('hide');

        checkIfRepositoriesAreUpToDate('', password);
    });

    $('#credential-provider-pop-up-ok-btn').on("click", function () {
        var $credentialsPopUp = $('#credential-provider-pop-up');

        var username = $('#credential-provider-pop-up-username').val();
        var password = $('#credential-provider-pop-up-password').val();

        $credentialsPopUp.modal('hide');

        checkIfRepositoriesAreUpToDate(username, password);
    });

    $('#credential-provider-pop-up-password').keyup(function (event) {
        if (event.keyCode === 13) {
            $('#credential-provider-pop-up-ok-btn').click();
        }
    });

    $('#ssh-passphrase-pop-up-password').keyup(function (event) {
        if (event.keyCode === 13) {
            $('#ssh-passphrase-pop-up-ok-btn').click();
        }
    });


    /* ------------------- Maven related code ------------------- */
    $(document).on("click", ".mvn-update-button", function () {
        var $mvnButton = $(this);
        $mvnButton.button('loading');

        // remove existing success/failure glyph
        if ($mvnButton.next('span').length > 0) {
            $mvnButton.next('span').remove();
        }

        var mavenModule = {
            "path": $mvnButton.attr("path"),
            "name": $mvnButton.attr("name"),
            "status": ""
        };

        $mvnButton.after(getDefaultLoadingAnimation(mavenModule))

        $.ajax({
            url: mvnUrl,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(mavenModule),

            statusCode: {
                200: function (response) {
                    removeMessageAfterTheButton($mvnButton);
                    displayMvnBuildStatus(response);
                },
                202: function (response) {
                    removeMessageAfterTheButton($mvnButton);
                    var responseMessage = response.responseText;
                    if ((responseMessage === MAVEN_PATH_NOT_FOUND_IN_PATH_VARIABLE) ||
                        (responseMessage === UNSUPPORTED_OPERATING_SYSTEM)) {
                        removeExistingMessage();
                        displayErrorMessage(displayErrorMessage(response.responseText + ". Module name: " + $mvnButton.parent().prev().text()));
                    }

                    if (responseMessage === MAVEN_INVOKER_FAILURE) {
                        //TODO Error message for MAVEN_INVOKER_FAILURE should be displayed per module
                    }
                },
                400: function (response) {
                    removeMessageAfterTheButton($mvnButton);
                    //TODO needs refactoring
                    removeExistingMessage();
                    displayErrorMessage(response.responseText + ". Module name: " + $mvnButton.parent().prev().text());
                }
            }
        });
        $mvnButton.button('reset');
    });

    function displayMvnBuildStatus(response) {
        var buildStatus = response.status;
        var $mavenModuleSelector = $("#maven-module-" + response.name);

        removeMessageAfterTheButton($mavenModuleSelector);

        if (buildStatus === MAVEN_BUILD_SUCCESS) {
            $mavenModuleSelector.after(createGlyphIcon(MAVEN_BUILD_SUCCESS, GLYPH_SUCCESS));
        } else if (buildStatus === MAVEN_BUILD_FAIL) {
            $mavenModuleSelector.after(createGlyphIcon(MAVEN_BUILD_FAIL, GLYPH_FAILURE));
        }
    }

    /* ------------------- Git related code ------------------- */
    $(document).on("click", ".git-update-button", function () {
        var $gitButton = $(this);

        $gitButton.button('loading');
        removeMessageAfterTheButton($gitButton);
        var gitRepository = {
            "path": $gitButton.attr("path"),
            "name": $gitButton.attr("name"),
            "status": ""
        };
        $gitButton.after(getDefaultLoadingAnimation(gitRepository));

        $.ajax({
            url: gitUrl,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(gitRepository),

            statusCode: {
                200: function (response) {
                    removeMessageAfterTheButton($gitButton);
                    displayGitPullStatus(response);
                },
                202: function (response) {
                    removeMessageAfterTheButton($gitButton);
                    displayGitPullAspenRestException(response, $gitButton);
                },
                400: function (response) {
                    //TODO needs refactoring
                    removeMessageAfterTheButton($gitButton);
                    removeExistingMessage();
                    displayErrorMessage(response.responseText + ". Module name: " + $gitButton.parent().prev().text());
                }
            }
        });

        $gitButton.button('reset');
    });


    function displayGitPullStatus(response) {
        var $gitRepositorySelector = $("#git-repository-" + response.name);

        $gitRepositorySelector.before(getGitRepositoryStatus(response));
        $gitRepositorySelector.remove();
    }


    function displayGitPullAspenRestException(response, $gitButton) {
        switch (response.status) {
            case GIT_REPOSITORY_NO_REMOTE_ORIGIN_FOUND_IN_THE_LOCAL_CONFIG:
                $gitButton.after(createGlyphIcon(GIT_REPOSITORY_NO_REMOTE_ORIGIN_FOUND_IN_THE_LOCAL_CONFIG, GLYPH_FAILURE));
                break;
            case GIT_ERROR_WHILE_UPDATING_REPOSITORY:
                $gitButton.after(createGlyphIcon(GIT_ERROR_WHILE_UPDATING_REPOSITORY, GLYPH_FAILURE));
                break;
            case ERROR_BUILDING_GIT_INSTANCE:
                $gitButton.after(createGlyphIcon(ERROR_BUILDING_GIT_INSTANCE, GLYPH_FAILURE));
                break;
        }
    }

    function createGlyphIcon(message, glypiconType) {
        switch (glypiconType) {
            case GLYPH_FAILURE:
                return "<span class=\"glyphicon glyphicon-remove " + glypiconType + "\" aria-hidden=\"true\" title=\"" + message + "\" >" +
                    "</span>";
            case GLYPH_SUCCESS:
                return "<span class=\"glyphicon glyphicon-ok " + glypiconType + "\" aria-hidden=\"true\" title=\"" + message + "\" >" +
                    "</span>";
        }
    }

    function removeMessageAfterTheButton($button) {
        if ($button.next('span').length > 0) {
            $button.next('span').remove();
        }
    }

    /* ------------------- Common code ------------------- */
    function removeExistingMessage() {
        if ($("#message-holder") !== null) {
            $("#message-holder").html("");
        }
    }

    function displayErrorMessage(message) {
        $("#message-holder").append(
            "<span class=\"error-message\">" + message +
            "</span>"
        );
    }
});
