<?php

namespace AppBundle\Entity\OAuth;

use FOS\OAuthServerBundle\Entity\Client as BaseClient;

class Client extends BaseClient
{
    protected $id;

    public function __construct()
    {
        parent::__construct();
    }
}
