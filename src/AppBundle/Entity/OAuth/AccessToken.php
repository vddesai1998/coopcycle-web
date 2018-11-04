<?php

namespace AppBundle\Entity\OAuth;

use FOS\OAuthServerBundle\Entity\AccessToken as BaseAccessToken;

class AccessToken extends BaseAccessToken
{
    protected $id;

    protected $client;

    protected $user;
}
