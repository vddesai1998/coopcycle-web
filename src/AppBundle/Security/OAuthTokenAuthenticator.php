<?php

namespace AppBundle\Security;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserProviderInterface;

use FOS\OAuthServerBundle\Security\Authentication\Token\OAuthToken;
use OAuth2\OAuth2;
use OAuth2\OAuth2AuthenticateException;
use OAuth2\OAuth2ServerException;
// use Symfony\Component\Security\Core\Exception\AuthenticationException;

class OAuthTokenAuthenticator extends AbstractGuardAuthenticator
{
    private $server;

    public function __construct($server, $security, $userManager)
    {
        $this->server = $server;
        $this->security = $security;
        $this->userManager = $userManager;
    }

    // https://symfony.com/doc/current/security/guard_authentication.html#avoid-authenticating-the-browser-on-every-request

    /**
     * Called on every request to decide if this authenticator should be
     * used for the request. Returning false will cause this authenticator
     * to be skipped.
     */
    public function supports(Request $request)
    {
        // return $request->headers->has('X-AUTH-TOKEN');
        if (null === $oauthToken = $this->server->getBearerToken($request)) {
            return false;
        }

        return true;
    }

    /**
     * Called on every request. Return whatever credentials you want to
     * be passed to getUser() as $credentials.
     */
    public function getCredentials(Request $request)
    {
        $tokenString = $this->server->getBearerToken($request, true);

        try {

            $accessToken = $this->server->verifyAccessToken($tokenString);

            $scope = $accessToken->getScope();
            // $user = $accessToken->getUser();

            // if (null !== $user) {
            //     try {
            //         $this->userChecker->checkPreAuth($user);
            //     } catch (AccountStatusException $e) {
            //         throw new OAuth2AuthenticateException(Response::HTTP_UNAUTHORIZED,
            //                 OAuth2::TOKEN_TYPE_BEARER,
            //                 $this->serverService->getVariable(OAuth2::CONFIG_WWW_REALM),
            //                 'access_denied',
            //                 $e->getMessage()
            //             );
            //     }

            //     $token->setUser($user);
            // }

            $roles = (null !== $user) ? $user->getRoles() : [];

            if (!empty($scope)) {
                foreach (explode(' ', $scope) as $role) {
                    $roles[] = 'ROLE_'.mb_strtoupper($role);
                }
            }

            $roles = array_unique($roles, SORT_REGULAR);

            $token = new OAuthToken($roles);
            $token->setAuthenticated(true);
            $token->setToken($tokenString);

            return $token;

        } catch (OAuth2ServerException $e) {
            throw new AuthenticationException('OAuth2 authentication failed', 0, $e);
        }

        // return array(
        //     'token' => $request->headers->get('X-AUTH-TOKEN'),
        // );
    }

    public function getUser($credentials, UserProviderInterface $userProvider)
    {
        // $user = $this->security->getUser();

        // var_dump($user);

        // var_dump('getUser');
        // print_r($credentials);
        // return;

        // $user = $this->userManager->createUser();

        // $user->setEnabled(true);

        // return $user;

        // $apiToken = $credentials['token'];

        // if (null === $apiToken) {
        //     return;
        // }

        // // if a User object, checkCredentials() is called
        // return $this->em->getRepository(User::class)
        //     ->findOneBy(['apiToken' => $apiToken]);
    }

    public function checkCredentials($credentials, UserInterface $user)
    {
        // check credentials - e.g. make sure the password is valid
        // no credential check is needed in this case

        // return true to cause authentication success
        return true;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
    {
        // on success, let the request continue
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        $data = array(
            'message' => strtr($exception->getMessageKey(), $exception->getMessageData())

            // or to translate this message
            // $this->translator->trans($exception->getMessageKey(), $exception->getMessageData())
        );

        return new JsonResponse($data, Response::HTTP_FORBIDDEN);
    }

    /**
     * Called when authentication is needed, but it's not sent
     */
    public function start(Request $request, AuthenticationException $authException = null)
    {
        $data = array(
            // you might translate this message
            'message' => 'Authentication Required'
        );

        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }

    public function supportsRememberMe()
    {
        return false;
    }
}
