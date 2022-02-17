/* eslint-disable react/display-name */
import React from "react";
import { RouteProps, Route, Routes, Navigate } from "react-router-dom";
import {
    LoginPage as DefaultLoginPage,
    ErrorComponent,
    LayoutWrapper,
    useAuthenticated,
    useIsAuthenticated,
    useResource,
    useRefineContext,
    useRouterContext,
    CanAccess,
    ResourceRouterParams,
} from "@pankod/refine-core";

const ResourceComponent: React.FC = () => {
    const { catchAll } = useRefineContext();
    const { useParams } = useRouterContext();
    const { resources } = useResource();

    const {
        resource: routeResourceName,
        action,
        id,
    } = useParams<ResourceRouterParams>();

    const resource = resources.find(
        (res) =>
            res.name === routeResourceName || res.route === routeResourceName,
    );

    if (resource) {
        const {
            list,
            create,
            edit,
            show,
            name,
            canCreate,
            canEdit,
            canShow,
            canDelete,
        } = resource;

        const List = list ?? (() => null);
        const Create = create ?? (() => null);
        const Edit = edit ?? (() => null);
        const Show = show ?? (() => null);

        const renderCrud = () => {
            switch (action) {
                case undefined:
                    return (
                        <CanAccess
                            resource={name}
                            action="list"
                            fallback={catchAll ?? <ErrorComponent />}
                        >
                            <List
                                name={name}
                                canCreate={canCreate}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canShow={canShow}
                            />
                        </CanAccess>
                    );
                case undefined:
                    return (
                        <CanAccess
                            resource={name}
                            action="list"
                            fallback={catchAll ?? <ErrorComponent />}
                        >
                            <List
                                name={name}
                                canCreate={canCreate}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canShow={canShow}
                            />
                        </CanAccess>
                    );

                case "create":
                case "clone":
                    return (
                        <CanAccess
                            resource={name}
                            action="create"
                            fallback={catchAll ?? <ErrorComponent />}
                        >
                            <Create
                                name={name}
                                canCreate={canCreate}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canShow={canShow}
                            />
                        </CanAccess>
                    );

                case "edit":
                    return (
                        <CanAccess
                            resource={name}
                            action="edit"
                            params={{ id }}
                            fallback={catchAll ?? <ErrorComponent />}
                        >
                            <Edit
                                name={name}
                                canCreate={canCreate}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canShow={canShow}
                            />
                        </CanAccess>
                    );

                case "show":
                    return (
                        <CanAccess
                            resource={name}
                            action="show"
                            params={{ id }}
                            fallback={catchAll ?? <ErrorComponent />}
                        >
                            <Show
                                name={name}
                                canCreate={canCreate}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canShow={canShow}
                            />
                        </CanAccess>
                    );
            }
        };

        return <LayoutWrapper>{renderCrud()}</LayoutWrapper>;
    }

    return <LayoutWrapper>{catchAll ?? <ErrorComponent />}</LayoutWrapper>;
};
const RouteProviderBase = () => {
    const { resources } = useResource();
    const { catchAll, DashboardPage, LoginPage } = useRefineContext();

    const { routes: customRoutes }: { routes: RouteProps[] } =
        useRouterContext();

    const isAuthenticated = useIsAuthenticated();
    const { isLoading } = useAuthenticated({ type: "routeProvider" });

    if (isLoading) {
        return (
            <Routes>
                <Route />
            </Routes>
        );
    }

    const CustomPathAfterLogin: React.FC = (): JSX.Element | null => {
        if (isLoading) {
            return null;
        }
        const { pathname, search } = location;
        const toURL = `${pathname}${search}`;

        return <Navigate to={`/login?to=${encodeURIComponent(toURL)}`} />;
    };

    const renderAuthorized = () => (
        <Routes>
            {[...(customRoutes || [])].map((route, i) => (
                <Route
                    key={`custom-route-${i}`}
                    {...route}
                    element={() => route.element}
                />
            ))}
            <Route
                path="/"
                element={
                    DashboardPage ? (
                        <LayoutWrapper>
                            <CanAccess
                                resource="dashboard"
                                action="list"
                                fallback={catchAll ?? <ErrorComponent />}
                            >
                                <DashboardPage />
                            </CanAccess>
                        </LayoutWrapper>
                    ) : (
                        <Navigate to={`/${resources[0].route}`} />
                    )
                }
            />
            <Route path=":resource" element={<ResourceComponent />}>
                <Route path=":action" element={<ResourceComponent />}>
                    <Route path=":id" element={<ResourceComponent />} />
                </Route>
            </Route>
        </Routes>
    );

    const renderUnauthorized = () => (
        <Routes>
            <Route
                path="/"
                element={LoginPage ? <LoginPage /> : <DefaultLoginPage />}
            />
            <Route
                path="/login"
                element={LoginPage ? <LoginPage /> : <DefaultLoginPage />}
            />
            {[...(customRoutes || [])].map((route, i) => (
                <Route key={`custom-route-${i}`} {...route} />
            ))}
            <Route path="*" element={<CustomPathAfterLogin />} />
        </Routes>
    );
    return isAuthenticated ? renderAuthorized() : renderUnauthorized();
};

/**
 * @internal
 */
export const RouteProvider = React.memo(RouteProviderBase);
