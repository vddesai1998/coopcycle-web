<?php

namespace AppBundle\Entity\OAuth;

use FOS\OAuthServerBundle\Entity\AuthCode as BaseAuthCode;

class AuthCode extends BaseAuthCode
{
    protected $id;

    protected $client;

    protected $user;
}
